import os.path
from datetime import date, timedelta
import json
from pathlib import Path

from bs4 import BeautifulSoup
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse

from language.models import Language, Macroarea, Family
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
            self.assertEqual(data.get('hint'), {
                'macroarea': True,
                'language': True,
                'family': True,
                'subfamily': True,
                'genus': True,
            })
        for lang in Language.objects.all()[3:6]:
            view = reverse("guess")+f"?solution={solution.id}&language={lang.id}"
            response = self.client.get(view)
            data = json.loads(response.content)
            self.assertNotEqual(data.get('hint'), {
                'macroarea': True,
                'language': True,
                'family': True,
                'subfamily': True,
                'genus': True,
            })

    def test_shuffle(self):
        """
        Make sure shuffle adds dates solutions missing them, distributes dates correctly, and leaves old & frozen
        solutions alone
        """
        today = date.today()
        shuffled = [
            Solution.objects.create(
                word=f'foo-{i}', ipa='fu', english='bar',
                language=Language.objects.all()[i],
            )
            for i in range(10)
        ]
        past = [
            Solution.objects.create(
                word=f'past {i}', ipa='fu', english='bar',
                language=Language.objects.all()[i],
                date=today - timedelta(days=i + 5)
            )
            for i in range(3)
        ]
        future = [
            Solution.objects.create(
                word=f'future {i}', ipa='fu', english='bar',
                language=Language.objects.all()[i],
                date=today + timedelta(days=(i + 1) * 5),
                freeze_date=False
            )
            for i in range(3)
        ]
        frozen = [
            Solution.objects.create(
                word=f'future {i}', ipa='fu', english='bar',
                language=Language.objects.all()[i],
                date=today + timedelta(days=(i + 1) * 6),
                freeze_date=True
            )
            for i in range(3)
        ]
        Solution.objects.all().shuffle()

        # make sure most solutions are given date and font
        for s in shuffled:
            s.refresh_from_db()
            self.assertIsNotNone(s.date)

        for s in future:
            s.refresh_from_db()
            self.assertIsNotNone(s.date)

        # make sure past solutions aren't changed
        for i, s in enumerate(past):
            s.refresh_from_db()
            self.assertEqual(s.date, today - timedelta(days=i + 5))

        # make sure frozen dates aren't changed
        for i, s in enumerate(frozen):
            s.refresh_from_db()
            self.assertEqual(s.date, today + timedelta(days=(i + 1) * 6))

        # make sure date gaps are filled
        dates = [
            (d - today).days
            for d in Solution.objects.order_by('date').values_list('date', flat=True)
        ]
        self.assertEqual(dates,  [-7, -6, -5, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 18])

    def test_import(self):
        ma = Macroarea.objects.first()
        fam = Family.objects.first()
        for name, id in [
            ('Basque', 'bsq'),
            ('Irish', 'iri'),
            ('Georgian', 'geo'),
            ('Urdo', 'urd'),
            ('Hindi', 'hin'),
            ('Faroese', 'far'),
            ('Icelandic', 'ice'),
            ('Serbian', 'src'),
            ('Sardinian', 'src'),
            ('Manchu', 'mnc'),
        ]:
            Language.objects.create(
                name=name, lang_id=id,
                other_names=[],
                latitude=0, longitude=0,
                macroarea=ma, family=fam
            )

        User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        url = reverse('admin:solution_solution_upload')
        response = self.client.get(url)
        self.assertRedirects(response, f'{reverse("admin:login")}?next={url}')
        self.client.login(username='admin', password='admin')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        self.assertEqual(Solution.objects.count(), 0)

        path = Path(__file__).resolve().parent
        with open(path / "import_test.csv", 'rb') as f:
            file = SimpleUploadedFile("import_test.csv", f.read(), content_type="text/csv")

        # verify missing language codes show errors
        response = self.client.post(url, {'file': file, 'shuffle': True})
        self.assertEqual(Solution.objects.count(), 0)
        soup = BeautifulSoup(response.content)
        errors = [
            e.text for e in soup.select('ul#fields li.error')
        ]
        self.assertEqual(errors, [
            "Language code does not exist: fao",
            "Multiple languages found for src",
        ])

        # flx languages, make sure it all gets in right
        Language.objects.filter(lang_id='far').update(lang_id='fao')
        Language.objects.filter(name='Serbian').update(lang_id='srp')
        with open(path / "import_test.csv", 'rb') as f:
            file = SimpleUploadedFile("import_test.csv", f.read(), content_type="text/csv")
        response = self.client.post(url, {'file': file, 'shuffle': True})
        self.assertEqual(Solution.objects.count(), 8)
        soup = BeautifulSoup(response.content)
        self.assertEqual(len(soup.select('tr.newlang')), 8)

        self.assertEqual(Solution.objects.filter(date__isnull=False).count(), 8)

        def langs(s):
            return (s.language.lang_id,) + tuple(s.alternates.values_list('lang_id', flat=True))

        def fname(f):
            if f:
                return os.path.basename(f)
            else:
                return ''

        solutions = {
            (s.word, s.romanization, s.english, s.es, s.fr, s.zh, fname(s.font), s.vertical, langs(s))
            for s in Solution.objects.all()
        }
        self.assertEqual(
            solutions,
            {
                ('adiskidetasun', '', 'friendship', 'amistad', 'amitié', '友谊', '', False, ('bsq',)),
                ('taoschnó', '', 'donut', 'rosquilla', 'donut', '甜甜圈', '', False, ('iri',)),
                ('ლანძღავს', 'lanʒɣavs', 'scold', 'regañar', 'gronder', '骂', 'NotoSansGeorgian-Regular.ttf', False, ('geo',)),
                ('عِبادَت', 'ibādat', 'worship', 'adoración', 'culte', '崇拜', 'NotoSansArabicUI-Regular.ttf', False, ('urd',)),
                ('گِرانا', 'girānā', 'drop', 'dejar caer', 'laisser tomber', '降低', 'NotoSansArabicUI-Regular.ttf', False, ('urd', 'geo', 'hin',)),
                ('ᠪᠣᠣᠪᠠᡳ', 'boobai', 'respectable', 'respetable', 'respectable', '可敬', 'NotoSansMongolian-Regular.ttf', True, ('mnc',)),
                ('orðabók', '', 'dictionary', 'diccionario', 'dictionnaire', '字典', '', False, ('fao', 'ice',)),
                ('необавезан', 'neobavezan', 'optional', 'opcional', 'optionnel', '可选的', 'NotoSansKR-Regular.otf', False, ('src',)),
            }
        )

        # test upload only diffs
        Solution.objects.get(word='adiskidetasun').delete()
        Solution.objects.get(word='ᠪᠣᠣᠪᠠᡳ').delete()
        self.assertEqual(Solution.objects.count(), 6)
        with open(path / "import_test.csv", 'rb') as f:
            file = SimpleUploadedFile("import_test.csv", f.read(), content_type="text/csv")
        response = self.client.post(url, {'file': file, 'shuffle': True})
        self.assertEqual(Solution.objects.count(), 8)
        soup = BeautifulSoup(response.content)
        self.assertEqual(len(soup.select('tr.newlang')), 2)
        self.assertEqual(
            {e.text for e in soup.select('tr.newlang a')},
            {'adiskidetasun', 'ᠪᠣᠣᠪᠠᡳ'}
        )
