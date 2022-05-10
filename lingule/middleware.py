import os

from whitenoise.middleware import WhiteNoiseMiddleware
from django.conf import settings


class RootWhiteNoiseMiddleware(WhiteNoiseMiddleware):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.add_file_to_dictionary('/', os.path.join(settings.BASE_DIR, "frontend/build/index.html"))

    def process_request(self, request):
        request.path_info = request.path_info.lower()
        return super().process_request(request)

    def configure_from_settings(self, settings):
        super().configure_from_settings(settings)
        self.static_prefix = "/"

    def add_file_to_dictionary(self, url, path, stat_cache=None):
        url = url.lower()
        super().add_file_to_dictionary(url, path, stat_cache=stat_cache)


def root_static_view(request):
    pass