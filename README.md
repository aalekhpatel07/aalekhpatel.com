> Note: This project is a fork of [chronark/chronark.com](https://github.com/chronark/chronark.com) but with a few modifications (apart from the content) like the addition of Github stars, some minor css tweaks, and dockerization of the project.


<div align="center">
    <a href="https://aalekhpatel.com"><h1 align="center">aalekhpatel.com</h1></a>
    
My personal website, built with [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Upstash](https://upstash.com?ref=aalekhpatel.com), [Contentlayer](https://www.contentlayer.dev/) and deployed to [Vercel](https://vercel.com/).

</div>

<br/>

## Running Locally


```sh-session
git clone https://github.com/aalekhpatel07/aalekhptel.com.git
cd aalekhpatel.com
```


Create a `frontend/.env.local` file similar to [`frontend/.env.example`](https://github.com/aalekhpatel07/aalekhpatel.com/blob/main/frontend/.env.example).

Start the docker-compose project:
```sh
docker-compose up -d
```

Visit http://localhost:3000 to view your local deployment. Any changes you make to the `frontend` directory will be updated on the page automatically.

## Deploying Resume

Upload PDF to the bucket:
```
aws s3 cp <file.pdf> s3://aalekhpatel.com/resume/resume.pdf
```

## Cloning / Forking

Please remove all of my personal information (projects, images, etc.) before deploying your own version of this site.
