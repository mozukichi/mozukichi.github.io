---
layout: page
title: zukkun.github.io
tagline: games and game development
---
{% include JB/setup %}

## Games

<ul>
{% for page in site.pages %}
{% for tag in page.tags %}
{% if tag == "game" %}
  <li><a href="{{ BASE_PATH }}{{ page.url }}">{{ page.title }}</a> {{ page.description }}</li>
{% endif %}
{% endfor %}
{% endfor %}
</ul>

## Demos

<ul>
{% for page in site.pages %}
{% for tag in page.tags %}
{% if tag == "demo" %}
  <li><a href="{{ BASE_PATH }}{{ page.url }}">{{ page.title }}</a> {{ page.description }}</li>
{% endif %}
{% endfor %}
{% endfor %}
</ul>

## Posts

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date: "%Y-%m-%d" }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>
