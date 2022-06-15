import os.path
from datetime import date, timedelta
from pathlib import Path

from django.conf import settings
from django.db import models
from fontTools.ttLib import TTFont

from i18n.models import Translatable
from language.models import Language


class Solution(Translatable):
    word = models.TextField()
    romanization = models.TextField(blank=True)
    ipa = models.TextField()
    english = models.TextField()
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    font = models.FilePathField(path=settings.FONT_ROOT, recursive=True, blank=True)
    alternates = models.ManyToManyField(Language, blank=True, related_name='alternate_solutions')
    hidden_options = models.ManyToManyField(Language, blank=True, related_name='hidden_solutions',
                                            limit_choices_to={'hidden': True})
    date = models.DateField(null=True, blank=True)
    freeze_date = models.BooleanField(default=False)
    order = models.PositiveIntegerField(null=True)
    victory_message = models.TextField(blank=True)
    failure_message = models.TextField(blank=True)

    translate_field = 'english'

    @property
    def font_url(self):
        return os.path.join('/', settings.FONT_URL, os.path.relpath(self.font, settings.FONT_ROOT))

    class Meta:
        ordering = ['-order']
        db_table = 'solution'

    def font_has_char(self, font, unicode_char):
        for cmap in font['cmap'].tables:
            if cmap.isUnicode():
                if ord(unicode_char) in cmap.cmap:
                    return True
        return False

    def detect_font(self, serif="Sans", weight="Regular"):
        files = list(Path(settings.FONT_ROOT).rglob(f"*{serif}*-{weight}.[to]tf"))
        for file in files:
            font = TTFont(file)
            if all([self.font_has_char(font, c) for c in self.word]):
                return file
        return ""

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

        if self.romanization and not self.font:
            self.font = self.detect_font()

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
