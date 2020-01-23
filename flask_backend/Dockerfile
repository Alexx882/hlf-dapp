FROM python:3

LABEL maintainer="m1herold@edu.aau.at"

RUN apt-get update -y

WORKDIR /app
COPY . /app

RUN pip3 install -r ./requirements.txt

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0"]
