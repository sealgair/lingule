import re
from itertools import islice

from django.core.management import BaseCommand
from google.cloud import translate_v2 as translate

from i18n.models import LANGUAGE_CHOICES, Translation
from language.models import Macroarea, Family, Subfamily, Genus, Language

MODELS = {
    m._meta.model_name: m
    for m in [Macroarea, Family, Subfamily, Genus, Language]
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
        parser.add_argument('--model', '-m', dest='model', choices=MODELS.keys(), default='language')

    def log(self, msg, level=1):
        if level <= self.verbosity:
            print(msg)

    def handle(self, *args, **options):
        self.verbosity = options.get('verbosity')
        limit = options.get('limit', None)
        target_langs = options.get('target_langs', [lc for lc, _ in LANGUAGE_CHOICES])
        batch_size = options.get('batch_size')
        model = options.get('model')
        Model = MODELS[model]

        objects = Model.objects.all()
        for target in target_langs:
            objects = objects.exclude(translations__language=target)
        if limit:
            objects = objects[:limit]

        context = "John speaks {}"
        target_regexes = {
            'es': r"(?:John|Juan)\s*(?:se)?\s*habla\s*(.*)",
            'fr': r"(?:John|Jean)\s*parle\s*(.*)",
            'ar': r"(?:John|جون|يوحنا)\s*(?:يتحدث|الناواتل)\s*(.*)",
            'zh': r"(?:John|约翰)说\s*(.*)",
        }
        "جون يتكلم الناواتل (هواوتشينانغو)"
        target_regexes = {
            k: re.compile(regex, flags=re.IGNORECASE)
            for k, regex in target_regexes.items()
        }

        self.log(f'translating {objects.count()} {Model._meta.verbose_name_plural}')
        translate_client = translate.Client()
        for b, batch in enumerate(batcher(objects, batch_size)):
            self.log(f'batch {b+1}', 2)
            words = [context.format(obj.name) for obj in batch]
            for lc in target_langs:
                regex = target_regexes[lc]
                results = translate_client.translate(words, target_language=lc, source_language='en')
                bulk = []
                for result, obj in zip(results, batch):
                    match = regex.match(result['translatedText'])
                    if match:
                        value = match.group(1)
                        self.log(f'{obj}->{lc}: {value}', 3)
                    else:
                        value = obj.name
                        self.log(f"could not parse translation from {result['translatedText']}, falling back to {value}")
                    bulk.append(Translation(object=obj, language=lc, value=value.lower()))
                Translation.objects.bulk_create(bulk)

