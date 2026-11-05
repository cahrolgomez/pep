import os

import psycopg
from psycopg.rows import dict_row


def connect():
    return psycopg.connect(
        host=os.environ['POSTGRES_HOST'], dbname=os.environ['POSTGRES_DB'],
        user=os.environ['POSTGRES_USER'], password=os.environ['POSTGRES_PASSWORD'],
        connect_timeout=5, row_factory=dict_row,
    )
