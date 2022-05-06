import math

from django.core.cache import cache
from django.db import models
from django.urls import reverse


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


class Macroarea(models.Model):
    name = models.TextField(unique=True)

    def __str__(self):
        return self.name


class Family(models.Model):
    name = models.TextField(unique=True)

    def __str__(self):
        return self.name


class Subfamily(models.Model):
    name = models.TextField()
    family = models.ForeignKey(Family, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Genus(models.Model):
    name = models.TextField()
    family = models.ForeignKey(Family, on_delete=models.CASCADE)
    subfamily = models.ForeignKey(Subfamily, null=True, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Language(models.Model):
    name = models.TextField(unique=True)
    lang_id = models.TextField(blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()

    macroarea = models.ForeignKey(Macroarea, on_delete=models.CASCADE)
    family = models.ForeignKey(Family, on_delete=models.CASCADE)
    subfamily = models.ForeignKey(Subfamily, null=True, blank=True, on_delete=models.CASCADE)
    genus = models.ForeignKey(Genus, null=True, blank=True, on_delete=models.CASCADE)

    hidden = models.BooleanField(default=False)

    class Meta:
        db_table = 'language'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def subfamily_cmp(self):
        """
        fall back to family if there is no subfamily
        """
        return self.subfamily_id or self.family_id

    def compare(self, other):
        """
        Return emoji string representing distance between languages
        """
        if self == other:
            return ["🟩", "🟩", "🟩", "🟩", "🟩", "🏆"]
        else:
            result = []
            keys = ['macroarea_id', 'family_id', 'subfamily_cmp', 'genus_id', 'id']
            if self.family.name in ['', 'other']:
                keys = ['macroarea_id', 'id', 'id', 'id', 'id']
            for key in keys:
                if getattr(self, key) == getattr(other, key):
                    result.append('🟩')
                else:
                    result.append('⬛')
        directions = [
            '⬆️', '↗️️', '➡️️', '↘️️️', '⬇️️', '↙️️️', '⬅️', '↖️️️️', '⬆️'
        ]
        bearing = get_bearing(
            (self.latitude, self.longitude),
            (other.latitude, other.longitude),
        )
        d = round(bearing / 45)
        result.append(directions[d])
        return result

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        super().save(force_insert, force_update, using, update_fields)
        # clear cache
        cache.delete(reverse('all_languages'))

