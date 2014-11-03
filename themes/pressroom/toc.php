<?php

/*
*
* theme: Pressroom
* rule: toc
* 
*/

// temporary fix to enable wp hook & filters inside PR-themes
require_once('inc/function.php');

$stylesheet = 'assets/css/toc.css';
?>
<!DOCTYPE html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title><?php the_title(); ?></title>
        <meta name="format-detection" content="telephone=no">
        <meta name="viewport" content="width=1536, user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
        <link rel="stylesheet" href="<?php echo $stylesheet; ?>">
    </head> 
    <body id="toc" class="<?php echo $post->post_name; ?>">
        <div class="swiper-container" style="height:<?php echo pr_get_option( 'pr-index-height' ).'px; width: 100%;'; ?>">
            <div class="swiper-wrapper">
                <?php
                if ( $posts->have_posts() ):
                    while ( $posts->have_posts() ):
                        $posts->the_post();
                        $image_id =  get_post_thumbnail_id();
                        $coverClass = '.cover__overlay--simple check';
                        if($image_id):
                            $attached_image = wp_get_attachment_metadata($image_id);
                            $image = wp_get_attachment_image_src($image_id, 'full');
                            $coverClass = 'item__overlay--simple check';
                            $titleClass = 'cover__title cover__title--resize check'; 
                            $metaClass = 'check'; 
                            $tocItemBg = 'background-image: url('.$image[0].'); background-position:0 0; background-repeat:no-repeat; background-size:cover;';
                        else:
                            $tocItemBg = 'background-image: url(\'http://press-room.dev.192.168.2.38.xip.io/wp-content/uploads/2014/08/Chancellor-George-Osborne.jpg\'); background-position:0 0; background-repeat:no-repeat; background-size:cover;';
                        endif;
                ?>     
                <article class="toc__item swiper-slide cover__image" style="<?php echo $tocItemBg; ?>">
                    <!-- <div class="cover__overlay <?php // echo $coverClass; ?>"></div> -->
                    <header> 
                        <h1 class="toc__title check"><a href="<?php echo get_permalink(); ?>" target="_parent"><?php the_title(); ?></a></h1>
                        <!-- <p class="toc__description"><?php //the_excerpt(); ?></p> -->
                    </header>
                </article>
                <?php endwhile; endif; ?>
            </div>
        </div>
        <script type="text/javascript" src="assets/js/toc.min.js"></script>
    </body>
</html>