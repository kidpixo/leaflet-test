FROM docker.io/python:3.11-alpine

WORKDIR /app
COPY requirements_server.txt /app/requirements_server.txt
RUN pip install --no-cache-dir -r requirements_server.txt

EXPOSE 44000
CMD ["python", "rangeserver.py", "44000"]