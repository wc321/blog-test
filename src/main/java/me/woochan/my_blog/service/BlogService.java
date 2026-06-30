package me.woochan.my_blog.service;

import lombok.RequiredArgsConstructor;
import me.woochan.my_blog.domain.Article;
import me.woochan.my_blog.dto.AddArticleRequest;
import me.woochan.my_blog.repository.BlogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class BlogService {

    private final BlogRepository blogRepository;

    public Article save(AddArticleRequest addArticleRequest) {
        return blogRepository.save(addArticleRequest.toEntity());
    }

    public List<Article> findAll() {
        return blogRepository.findAll();
    }

    public Article findById(long id) {
        return blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found: " + id));
    }

    public void delete(long id) {
        blogRepository.deleteById(id);
    }
}
