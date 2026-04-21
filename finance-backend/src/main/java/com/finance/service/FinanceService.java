package com.finance.service;

import com.finance.model.FinanceRecord;
import com.finance.repository.FinanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FinanceService {

    @Autowired
    private FinanceRepository repo;

    public List<FinanceRecord> getAll(String sort) {
        return switch (sort == null ? "" : sort) {
            case "amount,desc" -> repo.findAllByOrderByAmountDesc();
            case "date,desc"   -> repo.findAllByOrderByDateDesc();
            case "userName"    -> repo.findAllByOrderByUserNameAsc();
            default            -> repo.findAll();
        };
    }

    public Optional<FinanceRecord> getById(Long id) {
        return repo.findById(id);
    }

    public FinanceRecord create(FinanceRecord r) {
        r.setCreatedBy(r.getUserName());  // save username as createdBy
        r.setEditedBy("not edited");              // null initially
        r.setEditedDate(null);            // null initially
        return repo.save(r);
    }

    public FinanceRecord update(Long id, FinanceRecord updated) {
        FinanceRecord existing = repo.findById(id).orElseThrow();
        existing.setUserName(updated.getUserName());
        existing.setType(updated.getType());
        existing.setCategory(updated.getCategory());
        existing.setAmount(updated.getAmount());
        existing.setDescription(updated.getDescription());
        existing.setDate(updated.getDate());
        existing.setEditedBy(updated.getUserName());  // set username
        existing.setEditedDate(LocalDateTime.now());  // set current time
        return repo.save(existing);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}