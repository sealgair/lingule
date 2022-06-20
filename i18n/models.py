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
    translated_field = 'name'
    translation_fields = ('es', 'fr')
    es = models.TextField(verbose_name="spanish")
    fr = models.TextField(verbose_name="french")

    class Meta:
        abstract = True

    def get_language(self, language, default='en'):
        langs = self.all_languages
        return langs.get(language, langs.get(default))

    @property
    def all_languages(self):
        data = {'en': getattr(self, self.translated_field)}
        data.update({
            lang: getattr(self, lang)
            for lang in self.translation_fields
        })
        return data

    def translate(self, languages=None, overwrite=False, commit=True):
        if languages is None:
            languages = self.translation_fields
        translate_client = translate.Client()

        text = getattr(self, self.translated_field)
        for lc in languages:
            translation = getattr(self, lc)
            if translation and not overwrite:
                break
            result = translate_client.translate(text, target_language=lc, source_language='en')
            setattr(self, lc, result['translatedText'])
        self.save()

    def save(self, *args, **kwargs):
        self.translate(overwrite=False, commit=False)
        super().save(*args, **kwargs)

