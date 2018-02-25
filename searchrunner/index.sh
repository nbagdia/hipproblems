#!/bin/sh
python scraperapi.py &
python index.py &
python scraperapi_test.py
