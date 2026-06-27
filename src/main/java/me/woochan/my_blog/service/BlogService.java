package me.woochan.my_blog.service;

import lombok.RequiredArgsConstructor;
import me.woochan.my_blog.domain.Article;
import me.woochan.my_blog.dto.AddArticleRequest;
import me.woochan.my_blog.repository.BlogRepository;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class BlogService {

    private final BlogRepository blogRepository;

    public Article save(AddArticleRequest addArticleRequest) {
        return blogRepository.save(addArticleRequest.toEntity());
    }
}
