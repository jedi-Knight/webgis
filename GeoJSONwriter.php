<?php
	if(isset($_POST) && !empty($_POST)){
	//if(isset($_POST)){
		//$_POST['name'] = "file";
		$date = (string)date("Y-m-d h:i:sa");
		$strDate = str_replace(" ","-",$date);
		$strDate = str_replace(":","-",$strDate);	//':' is NOT a valid character for a filename. So replace it
		$myFile = $_POST['name'].$strDate.".geojson";
		$fh = fopen($myFile, 'w') or die("can't open file");
		$stringData = urldecode($_POST['payload']);
		fwrite($fh, $stringData);
		fclose($fh);
		//header("location:$myFile");
		//header('Content-Type: application/csv');
		/*header('Content-Type: application/octet-stream');
		header("Content-Disposition: attachment; filename=$myFile");
		header('Content-Length: ' . filesize($myFile));
		header('Pragma: no-cache');
		readfile("$myFile");
		print file_get_contents($myFile);
		//return (string)$myFile;*/
		echo (string)$myFile;
	}
?>