from datetime import date, timedelta
import json

from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse

from language.models import Language
from solution.models import Solution


class SolutionTestCase(TestCase):
    def setUp(self):
        call_command('import_languages', limit=10)

    def test_date_gaps(self):
        """
        Verify that null dates fill in gaps, and reorder subsequent solutions
        """
        for i in [3, 2]:
            Solution.objects.create(
                word=f'foo-{i}', ipa='fu', english='bar',
                language=Language.objects.all()[i],
                date=date.today() - timedelta(days=i)
            )
        for i in [1, 2, 3, 6, 7, 9]:
            Solution.objects.create(
                word=f'foo{i}', ipa='fu', english='bar',
                language=Language.objects.all()[i],
                date=date.today() + timedelta(days=i)
            )
        solution = Solution.objects.create(word='first', ipa='first', english='stuff', language=Language.objects.all()[0])
        solution.refresh_from_db()
        self.assertEqual(solution.date, date.today())
        self.assertEqual(solution.order, 3)
        self.assertEqual(
            list(Solution.objects.values_list('word', 'order').order_by('order')),
            [
                ('foo-3', 1),
                ('foo-2', 2),
                ('first', 3),
                ('foo1', 4),
                ('foo2', 5),
                ('foo3', 6),
                ('foo6', 7),
                ('foo7', 8),
                ('foo9', 9),
            ]
        )
        solution = Solution.objects.create(word='next', ipa='next', english='stuff', language=Language.objects.all()[0])
        solution.refresh_from_db()
        self.assertEqual(solution.date, date.today() + timedelta(4))
        self.assertEqual(solution.order, 7)
        self.assertEqual(
            list(Solution.objects.values_list('word', 'order').order_by('order')),
            [
                ('foo-3', 1),
                ('foo-2', 2),
                ('first', 3),
                ('foo1', 4),
                ('foo2', 5),
                ('foo3', 6),
                ('next', 7),
                ('foo6', 8),
                ('foo7', 9),
                ('foo9', 10),
            ]
        )

    def test_alternate_solutions(self):
        l1, l2, l3 = Language.objects.all()[:3]
        solution = Solution.objects.create(
            word=f'foo', ipa='fu', english='bar',
            language=l1, date=date.today()
        )
        solution.alternates.add(l2, l3)
        for lang in [l1, l2, l3]:
            view = reverse("guess")+f"?solution={solution.id}&language={lang.id}"
            response = self.client.get(view)
            data = json.loads(response.content)
            self.assertEqual(data.get('hint'), ["🟩", "🟩", "🟩", "🟩", "🟩", "🏆"])
        for lang in Language.objects.all()[3:6]:
            view = reverse("guess")+f"?solution={solution.id}&language={lang.id}"
            response = self.client.get(view)
            data = json.loads(response.content)
            self.assertNotEqual(data.get('hint'), ["🟩", "🟩", "🟩", "🟩", "🟩", "🏆"])
