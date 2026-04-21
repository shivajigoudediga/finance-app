package com.finance.repository;

import com.finance.model.FinanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FinanceRepository
        extends JpaRepository<FinanceRecord, Long> {

    List<FinanceRecord> findAllByOrderByAmountDesc();
    List<FinanceRecord> findAllByOrderByDateDesc();
    List<FinanceRecord> findAllByOrderByUserNameAsc();
}