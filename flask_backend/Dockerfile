FROM python:3

LABEL maintainer="m1herold@edu.aau.at"

ENV http_proxy http://proxy.uni-klu.ac.at:3128/ 
ENV https_proxy http://proxy.uni-klu.ac.at:3128/

RUN apt-get update -y

WORKDIR /app
COPY . /app

RUN pip3 install -r ./requirements.txt

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0"]
