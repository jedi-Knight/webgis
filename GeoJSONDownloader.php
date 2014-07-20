<?php
	if(isset($_GET) && !empty($_GET)){
	if($_GET['myFile']){
		//$_POST['name'] = "file";
		/*$date = (string)date("Y-m-d h:i:sa");
		$strDate = str_replace(" ","-",$date);
		$strDate = str_replace(":","-",$strDate);	//':' is NOT a valid character for a filename. So replace it
		$myFile = $_POST['name'].$strDate.".csv";
		$fh = fopen($myFile, 'w') or die("can't open file");
		$stringData = $_POST['payload'];
		fwrite($fh, $stringData);
		fclose($fh);*/
		//header("location:$myFile");
		//header('Content-Type: application/csv');
		
		$myFile=$_GET['myFile'];
		header('Content-Type: application/octet-stream');
		header("Content-Disposition: attachment; filename=$myFile");
		header('Content-Length: ' . filesize($myFile));
		header('Pragma: no-cache');
		readfile("$myFile");
		print file_get_contents($myFile);
		//return (string)$myFile;
		}
	}
?>