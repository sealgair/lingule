import csv
import os

from django.core.management import BaseCommand
from django.db import transaction

from language.models import Language


class Command(BaseCommand):
    help = 'Update language data from csv'

    def handle(self, *args, **options):
        dir = os.path.dirname(os.path.realpath(__file__))  # commands/
        dir = os.path.dirname(dir)  # management/
        dir = os.path.dirname(dir)  # language/
        langfile = os.path.join(dir, 'languages.csv')
        namefile = os.path.join(dir, 'language_names.csv')

        print("updating lang_ids")
        with transaction.atomic():
            with open(langfile) as file:
                reader = csv.DictReader(file)
                for r, row in enumerate(reader):
                    Language.objects.filter(name=row['Name']).update(lang_id=row['ID'])

        print("parsing names file")
        names_map = {}
        with open(namefile) as file:
            reader = csv.DictReader(file)
            for r, row in enumerate(reader):
                names_map.setdefault(row['Language_ID'], set()).add(row['Name'])

        print("saving names")
        with transaction.atomic():
            for lang_id, names in names_map.items():
                try:
                    lang = Language.objects.get(lang_id=lang_id)
                except Language.DoesNotExist:
                    pass
                else:
                    lang.other_names = list(names)
                    lang.save(update_fields=['other_names'])
