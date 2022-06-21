import math

from django.core.cache import cache
from django.db import models
from django.urls import reverse

from i18n.models import Translatable


def get_bearing(start_point, end_point):
    """
    Calculates the bearing between two points.

    Parameters
    ----------
    start_point: tuple (lat, long)
    end_point: tuple (lat, long)

    Returns
    -------
    point: int
        Bearing in degrees between the start and end points.
    """
    start_lat = math.radians(start_point[0])
    start_lng = math.radians(start_point[1])
    end_lat = math.radians(end_point[0])
    end_lng = math.radians(end_point[1])

    d_lng = end_lng - start_lng
    if abs(d_lng) > math.pi:
        if d_lng > 0.0:
            d_lng = -(2.0 * math.pi - d_lng)
        else:
            d_lng = (2.0 * math.pi + d_lng)

    tan_start = math.tan(start_lat / 2.0 + math.pi / 4.0)
    tan_end = math.tan(end_lat / 2.0 + math.pi / 4.0)
    d_phi = math.log(tan_end / tan_start)
    bearing = (math.degrees(math.atan2(d_lng, d_phi)) + 360.0) % 360.0

    return bearing


class Macroarea(Translatable):
    name = models.TextField(unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Family(Translatable):
    name = models.TextField(unique=True)

    class Meta:
        verbose_name_plural = 'Families'
        ordering = ['name']

    def __str__(self):
        return self.name


class Subfamily(Translatable):
    name = models.TextField()
    family = models.ForeignKey(Family, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = 'Subamilies'
        ordering = ['name']

    def __str__(self):
        return self.name


class Genus(Translatable):
    name = models.TextField()
    family = models.ForeignKey(Family, on_delete=models.CASCADE)
    subfamily = models.ForeignKey(Subfamily, null=True, blank=True, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = 'Genera'
        ordering = ['name']

    def __str__(self):
        return self.name


class Language(Translatable):
    lang_id = models.TextField(blank=True)
    name = models.TextField(unique=True)
    other_names = models.JSONField(blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()

    macroarea = models.ForeignKey(Macroarea, on_delete=models.CASCADE)
    family = models.ForeignKey(Family, on_delete=models.CASCADE)
    subfamily = models.ForeignKey(Subfamily, null=True, blank=True, on_delete=models.CASCADE)
    genus = models.ForeignKey(Genus, null=True, blank=True, on_delete=models.CASCADE)

    hidden = models.BooleanField(default=False)

    class Meta:
        db_table = 'language'
        ordering = ['macroarea__name', 'family__name', 'subfamily__name', 'genus__name', 'name']

    def __str__(self):
        return self.name

    @property
    def all_names(self):
        return [self.name] + self.other_names + list(self.all_languages.values())

    @property
    def subfamily_cmp(self):
        """
        fall back to family if there is no subfamily
        """
        if self.family_id:
            return f'f{self.family_id}'
        elif self.subfamily_id:
            return f'sf{self.subfamily_id}'

    def compare(self, other):
        """
        Return json comparison of various language fields
        """
        hint = {
            'macroarea': self.macroarea == other.macroarea,
            'language': self == other,
        }
        isolate = self.family.name in ['', 'other']
        for field in ['family_id', 'subfamily_cmp', 'genus_id']:
            key, _ = field.split('_')
            hint[key] = self == other or (
                    not isolate and getattr(self, field) == getattr(other, field)
            )

        if self != other:
            hint['bearing'] = get_bearing(
                (self.latitude, self.longitude),
                (other.latitude, other.longitude),
            )
        return hint

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        super().save(force_insert, force_update, using, update_fields)
        # clear cache
        cache.delete(reverse('all_languages'))

