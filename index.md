---
layout: page
title: zukkun.github.com
tagline: games and game development
---
{% include JB/setup %}

## Demos

{% for page in site.pages %}
{% for tag in page.tags %}
{% if tag == "demo" %}
<ul>
<li><a href="{{ page.url }}">{{ page.title }}</a> {{ page.description }}</li>
</ul>
{% endif %}
{% endfor %}
{% endfor %}

## Posts

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date: "%Y-%m-%d" }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>
