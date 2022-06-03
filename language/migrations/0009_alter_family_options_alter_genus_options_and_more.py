# Generated by Django 4.0.3 on 2022-06-02 20:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('language', '0008_language_other_names'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='family',
            options={'ordering': ['name'], 'verbose_name_plural': 'Families'},
        ),
        migrations.AlterModelOptions(
            name='genus',
            options={'ordering': ['name'], 'verbose_name_plural': 'Genera'},
        ),
        migrations.AlterModelOptions(
            name='language',
            options={'ordering': ['macroarea__name', 'family__name', 'subfamily__name', 'genus__name', 'name']},
        ),
        migrations.AlterModelOptions(
            name='macroarea',
            options={'ordering': ['name']},
        ),
        migrations.AlterModelOptions(
            name='subfamily',
            options={'ordering': ['name'], 'verbose_name_plural': 'Subamilies'},
        ),
    ]
