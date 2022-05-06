from datetime import date, timedelta

from django.db import models

from language.models import Language


class Solution(models.Model):
    word = models.TextField()
    english = models.TextField()
    ipa = models.TextField()
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    alternates = models.ManyToManyField(Language, blank=True, related_name='alternate_solution')
    date = models.DateField(null=True, blank=True)
    order = models.PositiveIntegerField(null=True)

    class Meta:
        ordering = ['-order']
        db_table = 'solution'

    def save(self, *args, **kwargs):
        overwrite = False
        if self.date is None:
            today = date.today()
            upcoming = set(Solution.objects.filter(date__gte=today).values_list('date', flat=True))
            td = 0
            while today + timedelta(days=td) in upcoming:
                td += 1
            self.date = today + timedelta(days=td)
            self.order = None
        else:
            try:
                overwrite = Solution.objects.exclude(id=self.id).get(date=self.date)
            except Solution.DoesNotExist:
                pass  # no harm, no foul
        super().save(*args, **kwargs)
        if self.order is None:
            try:
                order = Solution.objects.filter(date__lt=self.date).latest('date').order
            except Solution.DoesNotExist:
                order = 0
            for s in Solution.objects.filter(date__gte=self.date).order_by('date'):
                order += 1
                Solution.objects.filter(id=s.id).update(order=order)  # skip save method
        if overwrite:
            today = date.today()
            order = Solution.objects.get(date=today).order
            overwrite.date = None
            overwrite.save()
            for s in Solution.objects.filter(date__gt=today).order_by('date'):
                order += 1
                Solution.objects.filter(id=s.id).update(order=order)  # skip save method

    def __str__(self):
        return self.word
