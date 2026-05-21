package com.example.Quora.controllers;

import com.example.Quora.dtos.ApiResponse;
import com.example.Quora.dtos.UserResponseDto;
import com.example.Quora.dtos.TransactionResponseDto;
import com.example.Quora.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", adminService.getDashboardStats()));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponseDto>>> getAllTransactions() {
        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved", adminService.getAllTransactions()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", adminService.getAllUsers()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable("id") Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable("id") Long id) {
        adminService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted", null));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable("id") Long id) {
        adminService.deleteComment(id);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }

    @DeleteMapping("/tags/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTag(@PathVariable("id") Long id) {
        adminService.deleteTag(id);
        return ResponseEntity.ok(ApiResponse.success("Tag deleted", null));
    }
}
