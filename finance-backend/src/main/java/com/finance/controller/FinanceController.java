package com.finance.controller;

import com.finance.model.FinanceRecord;
import com.finance.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/finance")
@CrossOrigin(origins = "http://localhost:5173")
public class FinanceController {
    @Autowired
    private FinanceService service;

    // GET /finance?sort=amount,desc
    @GetMapping
    public List<FinanceRecord> getAll(
            @RequestParam(required = false) String sort) {
        return service.getAll(sort);
    }

    // GET /finance/{id}
    @GetMapping("/{id}")
    public ResponseEntity<FinanceRecord> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /finance
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FinanceRecord create(@RequestBody FinanceRecord record) {
        return service.create(record);
    }

    // PUT /finance/{id}
    @PutMapping("/{id}")
    public FinanceRecord update(
            @PathVariable Long id,
            @RequestBody FinanceRecord record) {
        return service.update(id, record);
    }

    // DELETE /finance/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
