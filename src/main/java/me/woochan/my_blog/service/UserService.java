package me.woochan.my_blog.service;


import lombok.RequiredArgsConstructor;
import me.woochan.my_blog.domain.User;
import me.woochan.my_blog.dto.AddUserRequest;
import me.woochan.my_blog.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Long save(AddUserRequest dto) {
        return userRepository.save(User.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .build()).getId();
    }
}
