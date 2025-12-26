package com.example.Quora.repository;

import com.example.Quora.models.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByAnswerId(@Param("answerId") Long answerId, Pageable pageable);

    Page<Comment> findByParentCommentId(@Param("parentCommentId") Long parentCommentId, Pageable pageable);
}
