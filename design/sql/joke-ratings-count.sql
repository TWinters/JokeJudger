SELECT j.id,count(r.user_id) FROM jhtyac2wwf9ny9ms.jokes as j INNER JOIN ratings as r ON j.id=r.joke_id GROUP BY j.id;

SELECT r.score,count(r.joke_id) FROM ratings as r GROUP BY r.score;