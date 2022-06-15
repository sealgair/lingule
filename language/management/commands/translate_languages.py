from django.core.management import BaseCommand
from google.cloud import translate_v2

class Command(BaseCommand):
    help = 'Translate language names'

    def add_arguments(self, parser):
        parser.add_argument('--file', '-f', dest='langfile', type=str)
        parser.add_argument('--limit', '-l', dest='limit', type=int)

    def handle(self, *args, **options):