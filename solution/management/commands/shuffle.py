from django.core.management import BaseCommand

from solution.models import Solution, today


class Command(BaseCommand):
    help = 'Shuffle upcoming solutions'

    def handle(self, *args, **options):
        Solution.objects.all().shuffle()