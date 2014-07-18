<?php
	if(isset($_GET) && !empty($_GET)){
            if($_GET['file']){
                $file=$_GET['file'];
                session_cache_limiter("nocache");
                header('Content-Type: application/json');
                header("Content-Disposition: attachment; filename=$file");
                header('Content-Length: ' . filesize($file));
                print file_get_contents($file);
            }
	}
?>