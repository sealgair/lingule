import re

from django.core.management import BaseCommand
from django.db.models import Q
from google.cloud import translate_v2 as translate

from i18n.models import LANGUAGE_CHOICES
from language.models import Language


class Command(BaseCommand):
    help = 'Translate language names'
    verbosity = 1

    def add_arguments(self, parser):
        parser.add_argument('--limit', '-l', dest='limit', type=int)
        parser.add_argument('--target-language', '-t', dest='target_langs', action='append')

    def log(self, msg, level=1):
        if level <= self.verbosity:
            print(msg)

    def handle(self, *args, **options):
        translate_client = translate.Client()
        limit = options.get('limit', None)
        target_langs = options.get('target_langs', [lc for lc, _ in LANGUAGE_CHOICES])
        self.verbosity = options.get('verbosity')

        languages = Language.objects.all()
        for target in target_langs:
            languages = languages.exclude(translations__language=target)
        if limit:
            languages = languages[:limit]

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

        self.log(f'translating {languages.count} languages')
        for obj in languages:
            self.log(f'translating {obj}', 2)
            for lc in target_langs:
                regex = target_regexes[lc]
                result = translate_client.translate(context.format(obj.name), target_language=lc, source_language='en')
                match = regex.match(result['translatedText'])
                self.log(f'\t{lc}...', 3)
                if match:
                    value = match.group(1)
                    self.log(f'\t{value}', 3)
                else:
                    value = obj.name
                    self.log(f"\tcould not parse translation from {result['translatedText']}, falling back to {value}")
                obj.translations.create(language=lc, value=value.lower())

