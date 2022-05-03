from datetime import date, timedelta

from django.db import models

from language.models import Language


class Solution(models.Model):
    word = models.TextField()
    english = models.TextField()
    ipa = models.TextField()
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    date = models.DateField(null=True, blank=True)
    order = models.PositiveIntegerField(null=True)

    class Meta:
        ordering = ['-order']
        db_table = 'solution'

    def save(self, *args, **kwargs):
        if self.date is None:
            latest = Solution.objects.aggregate(d=models.Max('date')).get('d')
            if latest:
                self.date = latest + timedelta(days=1)
            else:
                self.date = date.today()
        if self.order is None:
            self.order = (Solution.objects.aggregate(o=models.Max('order')).get('o') or 0) + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.word
