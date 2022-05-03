from django.http import JsonResponse
from django.views import View
from django.core.cache import cache


class ApiView(View):
    safe = True

    def cache_timeout(self):
        return 60 * 60 * 24

    def cache_vary(self, request, *args, **kwargs):
        return []

    def dispatch(self, request, *args, **kwargs):
        cache_key = ":".join([request.path] + self.cache_vary(request, *args, **kwargs))
        response = cache.get(cache_key)
        if response is None:
            result = super().dispatch(request, *args, **kwargs)
            response = JsonResponse(result, safe=self.safe)
            cache.set(cache_key, response, timeout=self.cache_timeout())
        return response
