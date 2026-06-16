package com.portfolio.backend;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/guestbook")
@CrossOrigin(origins = "http://localhost:5173")
public class GuestbookController {

    private final GuestbookRepository repository;

    public GuestbookController(GuestbookRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Guestbook> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Guestbook create(@RequestBody Guestbook guestbook) {
        return repository.save(guestbook);
    }

    // ❌ [최종 치트키 추가] 리액트에서 보낸 삭제 요청을 받아 DB에서 영구 소거하는 API
    @DeleteMapping("/{id}")
    public String deleteMessage(@PathVariable("id") Long id) {
        try {
            // 가은이의 내장 repository를 통해 데이터베이스 레코드를 완전히 파괴(Hard Delete)합니다.
            repository.deleteById(id);
            return "SUCCESS";
        } catch (Exception e) {
            return "FAIL";
        }
    }
}