import re
from itertools import islice

from django.core.management import BaseCommand
from google.cloud import translate_v2 as translate

from language.models import Family, Subfamily, Genus, Language

MODELS = {
    m._meta.model_name: m
    for m in [Family, Subfamily, Genus, Language]
}


def batcher(iterable, batch_size):
    iterator = iter(iterable)
    while batch := list(islice(iterator, batch_size)):
        yield batch


class Command(BaseCommand):
    help = 'Translate language names'
    verbosity = 1

    def add_arguments(self, parser):
        parser.add_argument('--limit', '-l', dest='limit', type=int)
        parser.add_argument('--batch-size', '-b', dest='batch_size', type=int, default=100)
        parser.add_argument('--target-language', '-t', dest='target_langs', action='append')
        parser.add_argument('--model', '-m', dest='model', choices=MODELS.keys(), action='append')
        parser.add_argument('--overwrite', '-o', dest='overwrite', action='store_true', default=False)

    def log(self, msg, level=1):
        if level <= self.verbosity:
            print(msg)

    def handle(self, *args, **options):
        self.verbosity = options.get('verbosity')
        models = options.get('model') or MODELS.keys()
        target_langs = options.get('target_langs') or Language.translation_fields
        batch_size = options.get('batch_size')
        limit_orig = options.get('limit', None)
        overwrite = options.get('overwrite', False)
        for target_lang in target_langs:
            limit = limit_orig
            for model in models:
                count = self.translate(MODELS[model], target_lang, batch_size, limit, overwrite=overwrite)
                if limit is not None:
                    limit -= count
                    if limit <= 0:
                        break

    def translate(self, Model, target_lang, batch_size, limit, overwrite=False):
        objects = Model.objects.all()
        if not overwrite:
            objects = objects.filter(**{target_lang: ''})
        if limit:
            objects = objects[:limit]

        context = "John speaks \"{}\""
        target_regexes = {
            'es': r"(?:John|Juan)\s*(?:se)?\s*habla\s*\"?(.*)\"?",
            'fr': r"(?:John|Jean)\s*parle\s*\"?(.*)\"?",
            'ar': r"(?:John|جون|يوحنا)\s*(?:يتحدث|الناواتل)\s*\"?(.*)\"?",
            'zh': r"(?:John|约翰)会?(?:说|讲)\s*\"?(.*)\"?",
        }
        target_regexes = {
            k: re.compile(regex, flags=re.IGNORECASE)
            for k, regex in target_regexes.items()
        }

        count = objects.count()
        self.log(f'translating {count} {Model._meta.verbose_name_plural} to {target_lang}')
        translate_client = translate.Client()
        for b, batch in enumerate(batcher(objects, batch_size)):
            self.log(f'batch {b+1}', 2)
            words = [context.format(obj.name) for obj in batch]
            regex = target_regexes[target_lang]
            results = translate_client.translate(words, target_language=target_lang, source_language='en')
            for result, obj in zip(results, batch):
                match = regex.match(result['translatedText'])
                if match:
                    value = match.group(1)
                    self.log(f'{obj}->{target_lang}: {value}', 3)
                else:
                    value = obj.name
                    self.log(f"could not parse translation from {result['translatedText']}, falling back to {value}")
                setattr(obj, target_lang, value.lower())
                obj.save(update_fields=[target_lang])
        return count

