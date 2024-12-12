import boto3
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('SUPABASE_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('SUPABASE_SECRET_ACCESS_KEY'),
    endpoint_url=os.getenv('SUPABASE_ENDPOINT_URL'),
    region_name=os.getenv('SUPABASE_REGION_NAME')
)

# Listar los buckets para verificar la conexión
response = s3_client.list_buckets()
print(response)