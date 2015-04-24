<?php

error_reporting(E_ALL);
require_once './includes/ScrollsGuide.php';

$filename = "results.json";
header("Content-Type: application/json");
header("Content-disposition: attachment;filename=$filename");



$scrollGuide = new ScrollsGuide("http://a.scrollsguide.com/");
$result = $scrollGuide->getAllResults();
//echo $result;

$jsonFile = fopen('results.json','w');
fwrite($jsonFile,$result);
fclose($jsonFile);
readfile($filename);

