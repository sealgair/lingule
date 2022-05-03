from datetime import date

from django.db import models

from language.models import Language


class SolutionManager(models.Manager):
    def today(self):
        return self.get(date=date.today())


class Solution(models.Model):
    word = models.TextField()
    english = models.TextField()
    ipa = models.TextField()
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    date = models.DateField(null=True)
    order = models.PositiveIntegerField(null=True)

    objects = SolutionManager()

    class Meta:
        ordering = ['-order']
        db_table = 'solution'

    def save(self, *args, **kwargs):
        if self.order is None and self.date is not None:
            self.order = (Solution.objects.aggregate(o=models.Max('order')).get('o') or 0) + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.word
