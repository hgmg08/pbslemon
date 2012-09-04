<?php

require('libs/pbs.php');
require('conf/pbs_server_conf.php');

abstract class PbslemonApplication extends EyeosApplicationExecutable {	
	public static function __run(AppExecutionContext $context, MMapResponse $response)
	{
		//EMPTY
	}

	public static function queueList($param)
	{
		$conn = pbs_connect(PBS_SERVER_NAME);
		$res = pbs_statque($conn, NULL, NULL, NULL);
		if(!$res) {
			$queues = NULL;
		}
		else {
			$queueNode = new batch_status($res);
			$queues = array();
			for($i = 0; $queueNode != NULL; $i++) {
				$queues[$i] = $queueNode->name;
				$queueNode = $queueNode->next;
			}
		}
		pbs_disconnect($conn);
		return $queues;
	}

	public static function jobStatus($param)
	{
		$conn = pbs_connect(PBS_SERVER_NAME);
		$res = pbs_statjob($conn, NULL, NULL, NULL);
		if(!$res) {
			$jobs = NULL;
		}
		else {
			$jobNode = new batch_status($res);
			$jobs = array();
			for($i = 0; $jobNode != NULL; $i++) {
				$j = 0;
				$jobs[$i][$j] = $jobNode->name;
				$jobAtt = $jobNode->attribs;
				for($j = 1; $jobAtt != NULL; $j++) {
					if($jobAtt->name == 'Job_Name') {
						$jobs[$i][$j] = $jobAtt->value;
						continue;
					}
					if($jobAtt->name == 'job_state') {
						$jobs[$i][$j] = $jobAtt->value;
						continue;
					}
					if($jobAtt->name == 'queue') {
						$jobs[$i][$j] = $jobAtt->value;
						continue;
					}
					if($jobAtt->name == 'start_time') {
						$jobs[$i][$j] = $jobAtt->value;
						continue;
					}
					if($jobAtt->name == 'comp_time') {
						$jobs[$i][$j] = $jobAtt->value;
						continue;
					}
					$jobAtt = $jobAtt->next;
				}
				$jobNode = $jobNode->next;
			}
		}
		pbs_disconnect($conn);
		return $jobs;
	}
}

?>
