from django.test import TestCase

from language.models import Language, Macroarea, Family, Subfamily, Genus


class TestLanguage(TestCase):
    def test_compare(self):
        a, b = [
            Language.objects.create(
                name=v,
                macroarea=Macroarea.objects.create(name=v),
                family=Family.objects.create(name=v),
                subfamily=Subfamily.objects.create(name=v, family=Family.objects.get(name=v)),
                genus=Genus.objects.create(name=v, family=Family.objects.get(name=v)),
                latitude=45,
                longitude=45 if v == 'A' else 90,
            ) for v in ['A', 'B']]
        self.assertEqual(a.compare(b), {
            'macroarea': False,
            'family': False,
            'subfamily': False,
            'genus': False,
            'bearing': 90,
            'language': False,
        })
        isolate = Language.objects.create(
            name='isolate',
            macroarea=Macroarea.objects.get(name='A'),
            family=Family.objects.create(name=''),
            latitude=45,
            longitude=0,
        )
        self.assertEqual(a.compare(isolate), {
            'macroarea': True,
            'family': False,
            'subfamily': False,
            'genus': False,
            'bearing': 270,
            'language': False,
        })
        nosubf = Language.objects.create(
            name='no subfamily',
            macroarea=b.macroarea,
            family=a.family,
            genus=b.genus,
            latitude=0,
            longitude=45,
        )
        self.assertEqual(a.compare(nosubf), {
            'macroarea': False,
            'family': True,
            'subfamily': True,
            'genus': False,
            'bearing': 180,
            'language': False,
        })
        nosubfb = Language.objects.create(
            name='no subfamily b',
            macroarea=b.macroarea,
            family=a.family,
            genus=a.genus,
            latitude=0,
            longitude=90,
        )
        self.assertEqual(nosubf.compare(nosubfb), {
            'macroarea': True,
            'family': True,
            'subfamily': True,
            'genus': False,
            'bearing': 90,
            'language': False,
        })
        self.assertEqual(a.compare(a), {
            'macroarea': True,
            'family': True,
            'subfamily': True,
            'genus': True,
            'language': True,
        })
        self.assertEqual(isolate.compare(isolate), {
            'macroarea': True,
            'family': True,
            'subfamily': True,
            'genus': True,
            'language': True,
        })
