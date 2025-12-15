package com.example.Quora.repository;

import com.example.Quora.models.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("""
            SELECT DISTINCT q
            FROM Question q
            JOIN FETCH q.user
            LEFT JOIN q.tags
            """)
    Page<Question> findAllWithUserAndTags(Pageable pageable);

    @Query("""
                SELECT q.id
                FROM Question q
                ORDER BY q.id DESC
            """)
    Page<Long> findQuestionIds(Pageable pageable);

    @Query("""
                SELECT DISTINCT q
                FROM Question q
                JOIN FETCH q.user
                LEFT JOIN FETCH q.tags
                WHERE q.id IN :ids
            """)
    List<Question> findWithUserAndTags(Set<Long> ids);

    @Query("""
            SELECT DISTINCT q
            FROM Question q
            JOIN FETCH q.user
            JOIN q.tags t
            WHERE t.id IN :tagIds
            """)
    Page<Question> findQuestionsByTags(Set<Long> tagIds, Pageable pageable);
}
