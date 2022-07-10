import csv
import os

from django.core.management import BaseCommand
from django.db import transaction

from language.models import Macroarea, Family, Subfamily, Genus, Language


class Command(BaseCommand):
    help = 'Import language data from csv'

    def add_arguments(self, parser):
        parser.add_argument('--file', '-f', dest='langfile', type=str)
        parser.add_argument('--limit', '-l', dest='limit', type=int)

    def handle(self, *args, **options):
        langfile = options.get('langfile')
        if not langfile:
            dir = os.path.dirname(os.path.realpath(__file__))  # commands/
            dir = os.path.dirname(dir)  # management/
            dir = os.path.dirname(dir)  # language/
            langfile = os.path.join(dir, 'languages.csv')
        limit = options.get('limit', None)

        languages = []

        with transaction.atomic():
            print('parsing langfile')
            with open(langfile) as file:
                reader = csv.DictReader(file)
                for r, row in enumerate(reader):
                    if limit is not None and r > limit:
                        break;
                    print(f'row {r}' + ' '*8, end='\r')
                    macroarea, _ = Macroarea.objects.get_or_create(name=row['Macroarea'])
                    family, _ = Family.objects.get_or_create(name=row['Family'])
                    if row['Subfamily']:
                        subfamily, _ = Subfamily.objects.get_or_create(
                            name=row['Subfamily'],
                            family=family,
                        )
                    else:
                        subfamily = None
                    if row['Genus']:
                        genus, _ = Genus.objects.get_or_create(
                            name=row['Genus'],
                            family=family,
                            subfamily=subfamily
                        )
                    else:
                        genus = None
                    languages.append(Language(
                        name=row['Name'],
                        other_names=[],
                        lang_id=row['ID'],
                        latitude=row['Latitude'],
                        longitude=row['Longitude'],
                        macroarea=macroarea,
                        family=family,
                        subfamily=subfamily,
                        genus=genus,
                    ))
        with transaction.atomic():
            print("langfile parsed, saving languages")
            Language.objects.bulk_create(languages)
