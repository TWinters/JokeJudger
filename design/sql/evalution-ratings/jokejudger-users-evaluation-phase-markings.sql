SELECT SUM(offensive), sum(incomprehensive) FROM markings as m WHERE date > '2017-08-07 00:00:00.000000' AND EXISTS (SELECT * FROM jokecreations AS c WHERE c.joke_id=m.joke_id and c.user_id>2 and c.user_id!=7628199);