# Generated by Django 4.0.3 on 2022-06-19 20:12

from django.db import migrations, models


def populate_translations(apps, schema_editor):
    Translation = apps.get_model('i18n', 'Translation')
    ContentType = apps.get_model('contenttypes', 'ContentType')

    for name in ['Language', 'Genus', 'Subfamily', 'Family', 'Macroarea']:
        ct = ContentType.objects.get(app_label='language', model=name.lower())
        translations = Translation.objects.filter(content_type=ct)
        Model = apps.get_model('language', name)
        for obj in Model.objects.all():
            for translation in translations.filter(object_id=obj.id):
                setattr(obj, translation.language, translation.value)
            obj.save()


class Migration(migrations.Migration):

    dependencies = [
        ('language', '0009_alter_family_options_alter_genus_options_and_more'),
        ('i18n', '0001_initial'),
        ('contenttypes', '0002_remove_content_type_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='family',
            name='es',
            field=models.TextField(default='', verbose_name='spanish'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='family',
            name='fr',
            field=models.TextField(default='', verbose_name='french'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='genus',
            name='es',
            field=models.TextField(default='', verbose_name='spanish'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='genus',
            name='fr',
            field=models.TextField(default='', verbose_name='french'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='language',
            name='es',
            field=models.TextField(default='', verbose_name='spanish'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='language',
            name='fr',
            field=models.TextField(default='', verbose_name='french'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='macroarea',
            name='es',
            field=models.TextField(default='', verbose_name='spanish'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='macroarea',
            name='fr',
            field=models.TextField(default='', verbose_name='french'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='subfamily',
            name='es',
            field=models.TextField(default='', verbose_name='spanish'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='subfamily',
            name='fr',
            field=models.TextField(default='', verbose_name='french'),
            preserve_default=False,
        ),
        migrations.RunPython(populate_translations, reverse_code=lambda a,b: None)
    ]