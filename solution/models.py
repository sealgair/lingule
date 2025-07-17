import os.path
from datetime import date, datetime, timezone, timedelta
from pathlib import Path

from django.conf import settings
from django.db import models
from django.db.models import Max
from fontTools.ttLib import TTFont

from i18n.models import Translatable
from language.models import Language


def today():
    tz = timezone(timedelta(hours=14))
    return datetime.now(tz).date()


class SolutionQueryset(models.QuerySet):
    def shuffle(self):
        self.filter(date__gt=today(), freeze_date=False).update(date=None)
        queryset = self.filter(date=None)
        new_date = today()
        known_dates = set(Solution.objects.exclude(date=None).filter(date__gte=new_date).values_list('date', flat=True))

        # randomize dates
        for solution in queryset.order_by('?'):
            while new_date in known_dates:
                new_date += timedelta(days=1)
            queryset.filter(id=solution.id).update(date=new_date)
            known_dates.add(new_date)

        # re-order
        todays = Solution.objects.get(date=today())
        if not todays.order:
            Solution.objects.filter(id=todays.id).update(order=1)
            todays.refresh_from_db()
        for o, solution in enumerate(Solution.objects.filter(date__gte=today()).order_by('date')):
            Solution.objects.filter(id=solution.id).update(order=o + todays.order + 1)

        return queryset


class SolutionManager(models.Manager):

    def get_queryset(self):
        return SolutionQueryset(self.model, using=self._db)

    def random_for(self, date):
        options = self.filter(
            date__gte="2022-05-09",
            date__lte=date - timedelta(days=365),
            freeze_date=False,
        )
        # filter out last 5 languages
        latest_languages = Language.objects.order_by("-solution__date")[:5]
        options.exclude(language__in=latest_languages)
        return options.order_by("?").first().make_copy(date)
    

class Solution(Translatable):
    word = models.TextField()
    romanization = models.TextField(blank=True)
    ipa = models.TextField()
    english = models.TextField()
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    font = models.FilePathField(path=settings.FONT_ROOT, recursive=True, blank=True)
    vertical = models.BooleanField(default=False)
    alternates = models.ManyToManyField(Language, blank=True, related_name='alternate_solutions')
    hidden_options = models.ManyToManyField(Language, blank=True, related_name='hidden_solutions',
                                            limit_choices_to={'hidden': True})
    date = models.DateField(null=True, blank=True)
    freeze_date = models.BooleanField(default=False)
    order = models.PositiveIntegerField(null=True)
    victory_message = models.TextField(blank=True)
    failure_message = models.TextField(blank=True)
    copy_of = models.ForeignKey("Solution", blank=True, null=True, on_delete=models.SET_NULL,
                                related_name='copied_from')

    objects = SolutionManager()

    translated_field = 'english'

    @property
    def font_url(self):
        return os.path.join('/', settings.FONT_URL, os.path.relpath(self.font, settings.FONT_ROOT))

    class Meta:
        ordering = ['-order']
        db_table = 'solution'

    def make_copy(self, date):
        copy = Solution.objects.get(pk=self.pk)
        copy.pk = None
        copy.id = None
        copy.date = date
        copy.copy_of = self
        return copy

    def font_has_char(self, font, unicode_char):
        for cmap in font['cmap'].tables:
            if cmap.isUnicode():
                if ord(unicode_char) in cmap.cmap:
                    return True
        return False

    def detect_font(self, serif=None, weight="Regular"):
        if serif is None:
            serifs = ['Sans', 'Serif']
        elif isinstance(serif, list):
            serifs = serif
        else:
            serifs = [serif]
        for serif in serifs:
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
