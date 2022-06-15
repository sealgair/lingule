from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models
from google.cloud import translate_v2 as translate

LANGUAGE_CHOICES = (
    ('es', 'Spanish'),
    ('fr', 'French'),
    # ('zh', 'Chinese'),
    # ('ar', 'Arabic'),
)


class Translation(models.Model):
    language = models.CharField(max_length=3, choices=LANGUAGE_CHOICES)
    value = models.TextField()
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    object = GenericForeignKey('content_type', 'object_id')

    translate_field = 'name'

    class Meta:
        unique_together = ['language', 'object_id', 'content_type']

    def __str__(self):
        return f'{self.value} ({self.language})'


class Translatable(models.Model):
    translations = GenericRelation(Translation)
    translate_field = 'name'

    class Meta:
        abstract = True

    def get_language(self, language, default='en'):
        langs = self.all_languages
        return langs.get(language, langs.get(default))

    @property
    def all_languages(self):
        data = {'en': getattr(self, self.translate_field)}
        data.update({
            trans.language: trans.value
            for trans in self.translations.all()
        })
        return data

    def translate(self, languages=None, overwrite=False):
        if languages is None:
            languages = [lc for lc, _ in LANGUAGE_CHOICES]
        translate_client = translate.Client()

        text = getattr(self, self.translate_field)
        known = {
            t.language: t
            for t in self.translations.all()
        }

        for lc in languages:
            translation = known.get(lc, Translation(object=self, language=lc))
            if translation.value and not overwrite:
                break
            result = translate_client.translate(text, target_language=lc, source_language='en')
            translation.value = result['translatedText']
            translation.save()

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.translate(overwrite=False)

