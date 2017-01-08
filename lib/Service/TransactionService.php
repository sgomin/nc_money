<?php

namespace OCA\Money\Service;

use Exception;

use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;

use OCA\Money\Db\Transaction;
use OCA\Money\Db\TransactionMapper;

class TransactionService {

  private $transactionMapper;

  public function __construct(TransactionMapper $transactionMapper) {
    $this->transactionMapper = $transactionMapper;
  }

  public function findAll($userId) {
    return $this->transactionMapper->findAll($userId);
  }

  private function handleException($e) {
    if ($e instanceof DoesNotExistException ||
        $e instanceof MultipleObjectsReturnedException) {
          throw new NotFoundException($e->getMessage());
    } else {
      throw $e;
    }
  }

  public function find($id, $userId) {
    try {
      return $this->transactionMapper->find($id, $userId);
    } catch(Exception $e) {
      $this->handleException($e);
    }
  }

  public function findTransactionsOfAccount($accountId, $userId) {
    try {
      return $this->transactionMapper->findAllTransactionsOfAccount($userId, $accountId);
    } catch(Exception $e) {
      $this->handleException($e);
    }
  }

  public function create($description, $timestamp, $userId) {
    $transaction = new Transaction();
    $transaction->setUserId($userId);

    $transaction->setDescription($description);
    $transaction->setTimestamp($timestamp);

    return $this->transactionMapper->insert($transaction);
  }

  public function update($id, $description, $timestamp, $userId) {
    try {
      $transaction = $this->transactionMapper->find($id, $userId);

      $transaction->setDescription($description);
      $transaction->setTimestamp($timestamp);

      return $this->transactionMapper->update($transaction);
    } catch(Exception $e) {
      $this->handleException($e);
    }
  }

}

?>