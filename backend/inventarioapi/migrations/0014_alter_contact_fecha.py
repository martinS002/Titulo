# Generated by Django 5.1.2 on 2024-12-12 03:59

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventarioapi', '0013_rename_created_at_contact_fecha'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contact',
            name='fecha',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
