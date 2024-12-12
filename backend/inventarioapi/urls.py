from rest_framework import routers
from .api import InventarioViewSet,TaskViewSet,ProveedorViewSet , VentasViewSet 
from django.urls import path
from django.urls import include
from django.conf import settings
from django.conf.urls.static import static
from . import views


router = routers.DefaultRouter()
router.register('api/inventario', InventarioViewSet, 'inventario')
router.register('api/task', TaskViewSet, 'task')
router.register('api/proveedor', ProveedorViewSet,'proveedor')
router.register('api/ventas', VentasViewSet,'ventas')
router.register('api/envios', views.EnvioViewSet)
router.register('api/notificaciones', views.NotificacionViewSet, 'notificaciones')
router.register('api/contact', views.ContactViewSet, 'contact')



urlpatterns = [
    path('',include(router.urls)),
    path('api/register/', views.register, name='register'),
    path('api/login/', views.login, name='login'),
    path('api/ventas/<int:venta_id>/', views.detalle_venta, name='detalle_venta'),
    path('api/init-transaction/', views.init_transaction, name='init_transaction'),
    path('api/confirm-transaction/', views.confirm_transaction, name='confirm_transaction'),
    path('api/actualizar-pedido/', views.actualizar_pedido, name='actualizar_pedido'),
    path('api/productos-mas-vendidos/', views.productos_mas_vendidos, name='productos_mas_vendidos'),
    path('api/categorias-productos/', views.categorias_productos, name='categorias_productos'),
    path('api/pedidos/<str:numero_pedido>/detalles-envio/', 
     views.obtener_detalles_envio, 
     name='detalles-envio'),
    path('api/pedidos/lista/', views.listar_pedidos, name='listar-pedidos'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

