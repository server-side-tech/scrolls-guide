<?php

/**
 * Description of ScrollsGuide
 *
 * @author waelshowair
 */
class ScrollsGuide {

    private $apiURL;
    const MAXIMUM_PLAYERS_NUMBER = 3000;
    const MAXIMUM_ROWS_NUMBER = 500;

    private $results;

    private $counter;

    private function getNextBatch($startIndex){
        // create a new cURL resource
        $curlResource = curl_init();

        //construct exact url api.
        $url  = $this->apiURL ."ranking?start=". $startIndex;
        $url .= "&limit=". self::MAXIMUM_ROWS_NUMBER;
        $url .= "&fields=name,rating,rank,rankedwon";

        // set URL and other appropriate options
        curl_setopt($curlResource, CURLOPT_URL, $url);

        curl_setopt($curlResource,CURLOPT_RETURNTRANSFER,true);

        // grab URL and pass it to the browser
        $content = curl_exec($curlResource);

        // close cURL resource, and free up system resources
        curl_close($curlResource);

        // takes a JSON encoded string and converts it into a PHP variable.
        return json_decode($content)->{"data"};
    }

    public function __construct($url) {
        $this->apiURL = $url;
        $this->results = '{"players":[';
        $this->counter = 0;
    }

    public function getAllResults(){
        for($i=0; $i< self::MAXIMUM_PLAYERS_NUMBER; $i+= self::MAXIMUM_ROWS_NUMBER){

            /* turn output buffering on. While output buffering is active no output is
             * sent from the script (other than headers), instead the output is stored
             * in an internal buffer.*/
            ob_start();

            /* Returns a string containing the JSON representation of value.*/
            $jsonString = json_encode($this->getNextBatch($i));
            $separator = (5==$i/self::MAXIMUM_ROWS_NUMBER)?"":",";
            $trimmedJsonString = rtrim($jsonString, "]").$separator;
            $this->results .= ltrim($trimmedJsonString,"[");

            /* Silently discard the buffer contents.*/
            ob_end_clean();
	}

        $this->results .="]}";
        return $this->results;
    }


}
