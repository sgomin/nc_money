<?php

namespace OCA\Money\BackgroundJob;

use Psr\Log\LoggerInterface;

use OCP\BackgroundJob\TimedJob;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\IDBConnection;

class CleanupDatabase extends TimedJob {

  public function __construct(ITimeFactory $time, IDBConnection $connection, LoggerInterface $logger) {
    parent::__construct($time);

    $this->connection = $connection;
    $this->logger = $logger;

    $this->setInterval(60 * 60); // run every 60 minutes
  }

  /**
	 * Makes the background job do its work
	 *
	 * @param array $argument unused argument
	 */
  public function run($argument) {
    // Remove splits with value = 0

    $sql = 'DELETE FROM *PREFIX*money_splits WHERE value = 0;';
    $deletedEntries = $this->connection->executeUpdate($sql);
    $this->logger->debug("$deletedEntries split(s) with zero value deleted", ['app' => 'Money']);

    // Remove orphaned splits (not belonging to any account or transaction)

    $sql = 'DELETE FROM *PREFIX*money_splits WHERE id IN (SELECT * FROM (SELECT a.id FROM *PREFIX*money_splits a WHERE NOT EXISTS (SELECT null FROM *PREFIX*money_transactions b WHERE a.transaction_id = b.id)) AS p)';
    $deletedEntries = $this->connection->executeUpdate($sql);
    $this->logger->debug("$deletedEntries orphaned split(s) deleted", ['app' => 'Money']);

    $sql = 'DELETE FROM *PREFIX*money_splits WHERE id IN (SELECT * FROM (SELECT a.id FROM *PREFIX*money_splits a WHERE NOT EXISTS (SELECT null FROM *PREFIX*money_accounts b WHERE a.dest_account_id = b.id)) AS p)';
    $deletedEntries = $this->connection->executeUpdate($sql);
    $this->logger->debug("$deletedEntries orphaned split(s) deleted", ['app' => 'Money']);

    // Remove orphaned transactions (without any splits)

    $sql = 'DELETE FROM *PREFIX*money_transactions WHERE id IN (SELECT * FROM (SELECT a.id FROM *PREFIX*money_transactions a WHERE NOT EXISTS (SELECT null FROM *PREFIX*money_splits b WHERE b.transaction_id = a.id)) AS p)';
    $deletedEntries = $this->connection->executeUpdate($sql);
    $this->logger->debug("$deletedEntries orphaned transaction(s) deleted", ['app' => 'Money']);
  }

}

?>
