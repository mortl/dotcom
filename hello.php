<?php
header('Content-Type: application/json');

$htCurl = curl_init();

curl_setopt_array($htCurl, Array(
	CURLOPT_URL            => 'https://wiki.headertag.com/feed/',
	CURLOPT_USERAGENT      => 'hello.js',
	CURLOPT_TIMEOUT        => 120,
	CURLOPT_CONNECTTIMEOUT => 30,
	CURLOPT_RETURNTRANSFER => TRUE,
	CURLOPT_ENCODING       => 'UTF-8'
));

$htData = curl_exec($htCurl);

curl_close($htCurl);

$kxCurl = curl_init();

curl_setopt_array($kxCurl, Array(
	CURLOPT_URL            => 'https://kx.indexexchange.com/feed/',
	CURLOPT_USERAGENT      => 'hello.js',
	CURLOPT_TIMEOUT        => 120,
	CURLOPT_CONNECTTIMEOUT => 30,
	CURLOPT_RETURNTRANSFER => TRUE,
	CURLOPT_ENCODING       => 'UTF-8'
));

$kxData = curl_exec($kxCurl);

curl_close($kxCurl);


$items = array();

$items['htblog'] = $htData;
$items['kxblog'] = $kxData;



echo json_encode($items);
?>
